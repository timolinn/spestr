package main

import (
	"github.com/gin-gonic/gin"
	"github.com/mlsquires/socketio"
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
}

func registerWebSocketRoutes(router *gin.Engine, wsServer *socketio.Server) {
	router.GET("/socket.io/", func(c *gin.Context) {
		wsServer.ServeHTTP(c.Writer, c.Request)
		wsServer.On("connection", func(s socketio.Socket) {
			log.Info("[socketio]: WS Connected.")
			resultChan := make(chan int)
			fastCom := fastdotcom.FastDotCom{
				Done: false,
			}
			go func() {
				fastCom.RunSpeedTest(resultChan)
			}()
		loop:
			for {
				for result := range resultChan {
					log.Printf("%d Kbps\n", result)
					fastCom.Network.Download = result
					// tells the browser that
					// computation is complete
					if result < 0 {
						fastCom.Done = true
						fastCom.IspInfo, _ = util.FetchISPInfo()
						s.Emit("test result", fastCom)
						break loop
					} else {
						s.Emit("test result", fastCom)
					}
				}
			}
		})
	})
}
