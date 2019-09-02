package postgres

import (
	"fmt"
	"os"
	"sync"

	"github.com/jinzhu/gorm"
	log "github.com/sirupsen/logrus"
)

var DB *gorm.DB
var once sync.Once

// ConnectToDatabase initializes the DB
func ConnectToDatabase(dialect, host string, port int, user, dbname, pass string) (*gorm.DB, error) {
	log.Info("initializing database...")
	var url string
	if databaseURL := os.Getenv("DATABASE_URL"); databaseURL != "" {
		url = databaseURL
	} else {
		url = fmt.Sprintf("sslmode=disable host=%s port=%d user=%s dbname=%s password=%s", host, port, user, dbname, pass)
	}
	once.Do(func() {
		var err error
		DB, err = gorm.Open(
			dialect,
			url)

		if err != nil {
			log.Fatalf("Failed to load %s DB: %s", dialect, err.Error())
		}
	})

	return DB, nil
}
