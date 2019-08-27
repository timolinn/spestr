package main

import (
	"github.com/gin-gonic/gin"
	log "github.com/sirupsen/logrus"

	socketio "github.com/googollee/go-socket.io"
	"github.com/timolinn/spestr/internal/config"
	"github.com/timolinn/spestr/internal/fastdotcom"
	"github.com/timolinn/spestr/internal/home"
	"github.com/timolinn/spestr/internal/locations"
)

func registerRoutes(router *gin.Engine, cfg *config.Configuration) {
	home.HandleHome(router)
	home.RunTest(router)
	locations.GetLocation(router, cfg)

	// Websocket route
	router.GET("/socket.io/", func(c *gin.Context) {
		server, err := socketio.NewServer(nil)
		if err != nil {
			log.Errorf("Error creating websocket connection: %s\n", err)
		}

		server.OnConnect("/", func(s socketio.Conn) error {
			log.Info("Client connected")
			return nil
		})
		fastCom := fastdotcom.FastDotCom{
			Done: false,
		}
		resultChan := make(chan int)
		go func() {
			fastCom.RunSpeedTest(resultChan)
		}()
		defer server.Close()
		server.ServeHTTP(c.Writer, c.Request)
		// loop:
		// 	for {
		// 		for result := range resultChan {
		// 			log.Printf("%d Kbps\n", result)
		// 			fastCom.Network.Download = result
		// 			// tells the browser that
		// 			// computation is complete
		// 			if result < 0 {
		// 				fastCom.Done = true
		// 				fastCom.IspInfo, _ = util.FetchISPInfo()
		// 				err := ws.WriteJSON(fastCom)
		// 				if err != nil {
		// 					log.Errorf("Error sending message: %v", err.Error())
		// 					ws.Close()
		// 				}
		// 				break loop
		// 			} else {
		// 				err := ws.WriteJSON(fastCom)
		// 				if err != nil {
		// 					log.Errorf("Error sending message: %v", err.Error())
		// 					ws.Close()
		// 					break loop
		// 				}
		// 			}
		// 		}
		// 	}
	})
}
