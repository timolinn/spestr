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

// for {
// 	msgType, msg, err := conn.ReadMessage()
// 	if err != nil {
// 		return
// 	}

// 	// Print the message to the console
// 	fmt.Printf("%s sent: %s\n", conn.RemoteAddr(), string(msg))

// 	// Write message back to browser
// 	if err = conn.WriteMessage(msgType, msg); err != nil {
// 		return
// 	}
// }
