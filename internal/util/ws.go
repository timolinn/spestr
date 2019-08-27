package util

import (
	"github.com/mlsquires/socketio"
	log "github.com/sirupsen/logrus"
)

func StartWebSocketServer() *socketio.Server {
	wsServer, err := socketio.NewServer(nil)
	if err != nil {
		log.Errorf("Error creating websocket connection: %s\n", err)
	}

	wsServer.On("error", func(so socketio.Socket, err error) {
		log.Errorf("[ socketio ]: Error: %v\n", err.Error())
	})
	wsServer.On("disconnect", func() {
		log.Info("Connection closed")
	})

	return wsServer
}
