package main

import (
	"github.com/gin-gonic/gin"
	"github.com/timolinn/spestr/internal/home"
	"github.com/timolinn/spestr/internal/locations"
)

func registerRoutes(router *gin.Engine) {
	home.HandleHome(router)
	home.RunTest(router)
	locations.GetLocation(router)
}
