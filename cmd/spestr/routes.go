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

		var coord locations.Coordinates
		var connectionEffectiveType string

		resultChan := make(chan int)
		fastCom := fastdotcom.FastDotCom{
			Done: false,
		}

		go func() {
			fastCom.RunSpeedTest(resultChan)
		}()

		wsServer.On("position", func(position locations.Coordinates) {
			log.Info("[socketio]: Postion: ", position)
			coord = position
		})

		wsServer.On("network type", func(ntype string) {
			log.Info("[socketio]: Network Type: ", ntype)
			connectionEffectiveType = ntype
			log.Info(coord.Coords)
			go func(fastCom fastdotcom.FastDotCom, coord locations.Coordinates, connType string) {
				defer func() {
					if err := recover(); err != nil {
						log.Error("goroutine paniced during saving. User likely denied location access")
						log.Error(err)
					}
				}()
				home.SaveNetworkData(fastCom, fastCom.IspInfo, coord, connType)
			}(fastCom, coord, connectionEffectiveType)
		})
		var done = make(chan bool, 1)

		wsServer.On("connection", func(s socketio.Socket) {
			s.On("disconnected", func() {
				done <- true
				log.Info("connection closed now...")
				// close(resultChan)
			})
			go func(done <-chan bool) {
			loop:
				for {
					for result := range resultChan {
						select {
						case <-done:
							log.Info("Done!! Breaking looop>>>>>>>>>>>>>>>>>>>>")
							break loop
						default:
							log.Printf("%d Kbps\n", result)
							// tells the browser that
							// computation is complete
							if result < 0 {
								fastCom.IspInfo, _ = util.FetchISPInfo(c.Request)
								fastCom.Done = true
								s.Emit("test result", fastCom)
								break loop
							} else {
								fastCom.Network.Download = result
								s.Emit("test result", fastCom)
							}
						}
					}

				}
			}(done)
		})
	})

	router.POST("/socket.io/", func(c *gin.Context) {
		log.Info("[HTTPPOST]: Ping")
	})
}
