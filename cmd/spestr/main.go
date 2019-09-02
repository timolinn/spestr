package main

import (
	"context"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/timolinn/spestr/internal/util"

	"github.com/timolinn/spestr/internal/config"
	"github.com/timolinn/spestr/internal/home"
	"github.com/timolinn/spestr/internal/isp"
	"github.com/timolinn/spestr/internal/locations"
	"github.com/timolinn/spestr/internal/platforms/postgres"

	"github.com/gin-gonic/gin"
	"github.com/jinzhu/gorm"
	_ "github.com/jinzhu/gorm/dialects/postgres"
	log "github.com/sirupsen/logrus"
)

func main() {
	config := config.New()

	// initailize logger
	// set to true only when environment
	// is in development
	config.InitLogger(config.Environment == "development")

	// Create database connection
	db := initDB(config)
	defer db.Close()
	// Migrate database
	runMigrations()

	router := gin.New()
	router.Use(gin.Logger(), gin.Recovery())
	router.LoadHTMLFiles("templates/views/index.html")
	router.Static("/js/", "./public/js")
	router.Static("/css/", "./public/css")
	router.Static("/img/", "./public/images")

	registerRoutes(router, config)

	// Start websocket server and register route
	wsServer := util.StartWebSocketServer()
	registerWebSocketRoutes(router, wsServer)

	var serverPort string
	if serverPort = os.Getenv("PORT"); serverPort == "" {
		serverPort = "8080"
	}
	srv := &http.Server{
		Addr:    ":" + serverPort,
		Handler: router,
	}

	go func() {
		// service connections
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("listen: %s\n", err)
		}
	}()
	// Wait for interrupt signal to gracefully shutdown the server with
	// a timeout of 5 seconds.
	quit := make(chan os.Signal, 1)
	// kill (no param) default send syscall.SIGTERM
	// kill -2 is syscall.SIGINT
	// kill -9 is syscall.SIGKILL but can't be caught
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Info("Shutdown Server ...")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := srv.Shutdown(ctx); err != nil {
		log.Fatal("Server Shutdown: ", err)
	}

	log.Info("Server exiting. ..")
}

func initDB(cfg *config.Configuration) *gorm.DB {
	db, err := postgres.ConnectToDatabase(cfg.Dialect(), cfg.DBHost(), cfg.DBPort(), cfg.DBUser(), cfg.DBName(), cfg.DBPass())
	if err != nil {
		log.Fatalf("error initializing database: %s", err.Error())
	}

	log.Info("database connection created")
	return db
}

func runMigrations() {
	log.Info("running migrations...")
	postgres.DB.AutoMigrate(
		&locations.Location{},
		&isp.IspModel{},
		&home.NetworkModel{},
	)
}

func closeDb() error {
	if postgres.DB != nil {
		if err := postgres.DB.Close(); err != nil {
			log.Errorf("could not close db connection %s", err.Error())
			return err
		}
	}
	return nil
}
