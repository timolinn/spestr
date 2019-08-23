package main

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/timolinn/spestr/internal/config"
	"github.com/timolinn/spestr/internal/home"
	"github.com/timolinn/spestr/internal/locations"
	"github.com/timolinn/spestr/internal/util"

	log "github.com/sirupsen/logrus"
)

func registerRoutes(router *gin.Engine, cfg *config.Configuration) {
	home.HandleHome(router)
	home.RunTest(router)
	locations.GetLocation(router, cfg)

	router.GET("/game", func(c *gin.Context) {
		c.HTML(http.StatusOK, "index.html", gin.H{})
	})

	// Websocket route
	router.GET("/ws", func(c *gin.Context) {
		ws, err := util.Upgrader.Upgrade(c.Writer, c.Request, nil)
		if err != nil {
			log.Errorf("Error connecting to Websocket: %s\n", err)
		}

		defer ws.Close()

		idx := 0
		for {
			idx++
			err := ws.WriteMessage(1, []byte{byte(1 + idx)})
			if err != nil {
				log.Errorf("Error sending message: %v", err.Error())
			}
		}
	})
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
