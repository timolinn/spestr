package main

import (
	"github.com/gin-gonic/gin"
	"github.com/timolinn/spestr/internal/config"
	"github.com/timolinn/spestr/internal/home"
	"github.com/timolinn/spestr/internal/locations"
)

func registerRoutes(router *gin.Engine, cfg *config.Configuration) {
	home.HandleHome(router)
	home.RunTest(router)
	locations.GetLocation(router, cfg)
}
