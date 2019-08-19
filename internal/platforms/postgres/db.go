package postgres

import (
	"fmt"

	"github.com/jinzhu/gorm"
	log "github.com/sirupsen/logrus"
)

// InitDatabase initializes the DB
func InitDatabase(host string, port int, user, dbname, pass string) (*gorm.DB, error) {
	log.Info("initializing database...")
	db, err := gorm.Open(
		"postgres",
		fmt.Sprintf("sslmode=disable host=%s port=%d user=%s dbname=%s password=%s", host, port, user, dbname, pass))

	defer db.Close()
	if err != nil {
		log.Errorf("Failed to load %s DB: %s", "postgres", err.Error())
		return nil, err
	}

	return db, nil
}
