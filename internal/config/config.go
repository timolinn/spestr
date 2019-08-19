package config

import (
	"fmt"
	"io"
	"io/ioutil"
	"os"

	"gopkg.in/yaml.v2"

	log "github.com/sirupsen/logrus"
	"github.com/timolinn/spestr/internal/util"
)

var logPath = "public/logs/"

// Configuration is the general application
// configuration settings
type Configuration struct {
	Google struct {
		APIKey string `yaml:"apiKey"`
	}
	Token       string `yaml:"token"`
	Environment string `yaml:"environment"`
	Logs        string `yaml:"logs"`
	Database    struct {
		Driver   string `yaml:"dialect"`
		Postgres *PostgresConfig
	}
}

// PostgresConfig is the database config
type PostgresConfig struct {
	User     string `yaml:"user"`
	Dbname   string `yaml:"dbname"`
	Password string `yaml:"password"`
	PORT     int    `yaml:"port"`
	Host     string `yaml:"host"`
}

// InitLogger configures the logger
func (c *Configuration) InitLogger(debug bool) {
	logFile := logPath + c.Logs

	// open log file for read and write
	file, err := os.OpenFile(logFile, os.O_RDWR|os.O_CREATE|os.O_APPEND, 0666)
	if err != nil {
		log.Fatalf("Unable to open %s: failed with %s\n", logFile, err)
	}

	// use multiwriter to enable both file and stdout logs
	mw := io.MultiWriter(os.Stdout, file)
	log.SetOutput(mw)

	if c.Environment == "production" {
		log.SetFormatter(&log.JSONFormatter{})
	} else {
		log.SetFormatter(&log.TextFormatter{
			FullTimestamp: true,
			ForceColors:   true,
		})
	}

	if debug == true {
		log.SetLevel(log.DebugLevel)
	} else {
		log.SetLevel(log.InfoLevel)
	}
}

// New creates a new *Configuration
func New() *Configuration {
	cfg := new(Configuration)
	// TODO: select config file based on environment
	err := cfg.SetValuesFromFile("spestr.yml")
	if err != nil {
		log.Fatalf("Loading configuration file failed: %s", err.Error())
	}
	return cfg
}

// SetValuesFromFile reads a yaml config file nad sets
// the values to the config setting
func (c *Configuration) SetValuesFromFile(fileName string) error {
	if !util.Exists(fileName) {
		return fmt.Errorf("config file not found: \"%s\"", fileName)
	}
	yamlConfig, err := ioutil.ReadFile(fileName)
	if err != nil {
		return err
	}

	return yaml.Unmarshal(yamlConfig, c)
}

// GoogleAPIKey gets the google maps apikey
func (c *Configuration) GoogleAPIKey() string {
	return c.Google.APIKey
}

// Dialect returns the database driver name
func (c *Configuration) Dialect() string {
	return c.Database.Driver
}

// DBHost returns database Host, "localhost" by default
func (c *Configuration) DBHost() string {
	return c.Database.Postgres.Host
}

// DBPort returns database Port
func (c *Configuration) DBPort() int {
	return c.Database.Postgres.PORT
}

// DBName returns database name
func (c *Configuration) DBName() string {
	return c.Database.Postgres.Dbname
}

// DBUser returns database User
func (c *Configuration) DBUser() string {
	return c.Database.Postgres.User
}

// DBPass returns database Password
func (c *Configuration) DBPass() string {
	return c.Database.Postgres.Password
}
