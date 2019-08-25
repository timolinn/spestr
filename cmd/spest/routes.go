package main

import (
	"github.com/gin-gonic/gin"
	log "github.com/sirupsen/logrus"

	"github.com/timolinn/spestr/internal/config"
	"github.com/timolinn/spestr/internal/fastdotcom"
	"github.com/timolinn/spestr/internal/home"
	"github.com/timolinn/spestr/internal/locations"
	"github.com/timolinn/spestr/internal/util"
)

func registerRoutes(router *gin.Engine, cfg *config.Configuration) {
	home.HandleHome(router)
	home.RunTest(router)
	locations.GetLocation(router, cfg)

	// Websocket route
	router.GET("/ws", func(c *gin.Context) {
		ws, err := util.Upgrader.Upgrade(c.Writer, c.Request, nil)
		if err != nil {
			log.Errorf("Error connecting to Websocket: %s\n", err)
		}

		fastCom := fastdotcom.FastDotCom{
			Done: false,
		}
		resultChan := make(chan int)
		go fastCom.RunSpeedTest(resultChan)
		defer ws.Close()

	loop:
		for {
			for result := range resultChan {
				log.Printf("%d Kbps\n", result)
				fastCom.Network.Download = result
				// tells the browser that
				// computation is complete
				if result < 0 {
					fastCom.Done = true
					err := ws.WriteJSON(fastCom)
					if err != nil {
						log.Errorf("Error sending message: %v", err.Error())
					}
					break loop
				} else {
					err := ws.WriteJSON(fastCom)
					if err != nil {
						log.Errorf("Error sending message: %v", err.Error())
						break
					}
				}
			}
		}
	})
}
