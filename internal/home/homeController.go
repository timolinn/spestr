package home

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/timolinn/spestr/internal/fastdotcom"
)

func HandleHome(router *gin.Engine) {
	router.GET("/", func(c *gin.Context) {
		c.HTML(http.StatusOK, "index.html", gin.H{
			"fastCom": fastdotcom.FastDotCom{},
		})
	})
}

func RunTest(router *gin.Engine) {
	router.GET("/test", func(c *gin.Context) {
		c.HTML(http.StatusOK, "index.html", gin.H{})
	})
}
