package home

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/timolinn/spestr/internal/fastdotcom"
	"github.com/timolinn/spestr/internal/util"

	log "github.com/sirupsen/logrus"
)

func HandleHome(router *gin.Engine) {
	router.GET("/", func(c *gin.Context) {
		c.HTML(http.StatusOK, "index.html", gin.H{
			"fastCom": fastdotcom.FastDotCom{},
		})
	})

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

		for {
			for result := range resultChan {
				log.Printf("%d Mbps\n", result)
				fastCom.Network.Download = result
				// tells the browser that
				// computation is complete
				if result < 0 {
					fastCom.Done = true
				}
				err := ws.WriteJSON(fastCom)
				if err != nil {
					log.Errorf("Error sending message: %v", err.Error())
					break
				}

			}
		}
	})
}

func RunTest(router *gin.Engine) {
	router.GET("/test", func(c *gin.Context) {
		c.HTML(http.StatusOK, "index.html", gin.H{})
	})
}
