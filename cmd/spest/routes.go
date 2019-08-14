package main

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func registerRoutes(router *gin.Engine) {
	router.GET("/", func(c *gin.Context) {
		// time.Sleep(5 * time.Second)
		c.String(http.StatusOK, "Welcome to Spest")
	})
}
