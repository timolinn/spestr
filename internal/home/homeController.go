package home

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/timolinn/spestr/internal/fastdotcom"
)

func HandleHome(router *gin.Engine) {
	router.GET("/", func(c *gin.Context) {
		resultsChannel := make(chan int)
		fastCom := fastdotcom.FastDotCom{}

		go func() {
			for result := range resultsChannel {
				fmt.Println(result)
			}
		}()
		fastCom, _ = fastCom.RunSpeedTest(resultsChannel)
		// c.String(http.StatusOK, "Your internet speed is "+strconv.Itoa(fastCom.Network.Download)+"Mbps")
		c.HTML(http.StatusOK, "index.html", gin.H{
			"fastCom": fastCom,
		})
	})
}

func RunTest(router *gin.Engine) {
	router.GET("/test", func(c *gin.Context) {
		c.HTML(http.StatusOK, "index.html", gin.H{})
	})
}
