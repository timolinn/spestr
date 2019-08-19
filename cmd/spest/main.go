package main

import (
	"context"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/timolinn/spestr/internal/config"
	"github.com/timolinn/spestr/internal/platforms/postgres"

	"github.com/gin-gonic/gin"
	_ "github.com/jinzhu/gorm/dialects/postgres"
	log "github.com/sirupsen/logrus"
)

func main() {
	router := gin.New()
	config := config.New()

	// initailize logger
	// set to true only when environment
	// is in development
	config.InitLogger(config.Environment == "development")

	// Create database connection
	initDB(config)

	router.Use(gin.Logger() /* ,gin.Recovery()*/)
	router.LoadHTMLFiles("templates/views/index.html")
	router.Static("/js/", "./public/js")
	router.Static("/css/", "./public/css")
	router.Static("/img/", "./public/images")

	registerRoutes(router, config)

	srv := &http.Server{
		Addr:    ":8080",
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
	// kill (no param) default send syscanll.SIGTERM
	// kill -2 is syscall.SIGINT
	// kill -9 is syscall. SIGKILL but can"t be catch, so don't need add it
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Println("Shutdown Server ...")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := srv.Shutdown(ctx); err != nil {
		log.Fatal("Server Shutdown: ", err)
	}

	log.Println("Server exiting")
}

func initDB(cfg *config.Configuration) {
	err := postgres.InitDatabase("postgres", cfg.DBHost(), cfg.DBPort(), cfg.DBUser(), cfg.DBName(), cfg.DBPass())
	if err != nil {
		log.Fatalf("error initializing database: %s", err.Error())
	}

	log.Info("database created")
}
