package postgres

import (
	"fmt"

	"github.com/jinzhu/gorm"
	log "github.com/sirupsen/logrus"
)

// InitDatabase initializes the DB
func InitDatabase(dialect, host string, port int, user, dbname, pass string) error {
	log.Info("initializing database...")
	db, err := gorm.Open(
		dialect,
		fmt.Sprintf("sslmode=disable host=%s port=%d user=%s dbname=%s password=%s", host, port, user, dbname, pass))

	defer db.Close()
	if err != nil {
		log.Errorf("Failed to load %s DB: %s", dialect, err.Error())
	}
	return err
}
