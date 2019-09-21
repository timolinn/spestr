package home

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/timolinn/spestr/internal/fastdotcom"
	"github.com/timolinn/spestr/internal/util"
)

func HandleHome(router *gin.Engine) {
	router.GET("/", func(c *gin.Context) {
		c.HTML(http.StatusOK, "index.html", gin.H{
			"fastCom": new(fastdotcom.FastDotCom),
		})
	})
}

func RunTest(router *gin.Engine) {
	router.GET("/test", func(c *gin.Context) {
		fastCom := new(fastdotcom.FastDotCom)
		fastCom.IspInfo, _ = util.FetchISPInfo(c.Request)
		fmt.Println(fastCom.IspInfo)
		c.String(http.StatusOK, "Done.")
	})
}
