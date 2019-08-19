package postgres

import (
	"fmt"

	"github.com/jinzhu/gorm"
	log "github.com/sirupsen/logrus"
)

// ConnectToDatabase initializes the DB
func ConnectToDatabase(dialect, host string, port int, user, dbname, pass string) (*gorm.DB, error) {
	log.Info("initializing database...")
	db, err := gorm.Open(
		dialect,
		fmt.Sprintf("sslmode=disable host=%s port=%d user=%s dbname=%s password=%s", host, port, user, dbname, pass))

	if err != nil {
		log.Errorf("Failed to load %s DB: %s", dialect, err.Error())
		return nil, err
	}

	return db, nil
}
