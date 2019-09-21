package config

import (
	"fmt"
	"io"
	"io/ioutil"
	"os"
	"strconv"

	"github.com/joho/godotenv"
	"gopkg.in/yaml.v2"

	log "github.com/sirupsen/logrus"
	"github.com/timolinn/spestr/internal/util"
)

var logPath = "public/logs/"
var configFile string

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
	if os.Getenv("APP_ENV") == "heroku" {
		return
	}
	logFile := logPath + c.Logs

	// open log file for read and write
	file, err := os.OpenFile(logFile, os.O_RDWR|os.O_CREATE|os.O_APPEND, 0666)
	if err != nil {
		log.Errorf("Unable to open %s: failed with %s\n", logFile, err)
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
	err := godotenv.Load()
	if err != nil && os.Getenv("APP_ENV") != "heroku" {
		if os.Getenv("APP_ENV") == "test" {
			// hard code absolute path to config file
			configFile = "/Users/timothyonyiuke/Documents/deark/Golang/spestr/spestr.yml"
		} else {
			log.Fatal("Error loading .env file")
		}
	} else {
		configFile = os.Getenv("CONFIG_FILE")
	}

	cfg := new(Configuration)
	err = cfg.SetValuesFromFile(configFile)
	if err != nil && os.Getenv("APP_ENV") == "heroku" {
		err = cfg.SetValuesFromFile("sample.spestr.yml")
	}

	if err != nil {
		log.Fatalf("Loading configuration file failed: %s", err.Error())
	}
	return cfg
}

// SetValuesFromFile reads a yaml config file nad sets
// the values to the config setting
func (c *Configuration) SetValuesFromFile(filePath string) error {
	if !util.Exists(filePath) {
		return fmt.Errorf("config file not found: \"%s\"", filePath)
	}
	yamlConfig, err := ioutil.ReadFile(filePath)
	if err != nil {
		return err
	}

	return yaml.Unmarshal(yamlConfig, c)
}

// GoogleAPIKey gets the google maps apikey
func (c *Configuration) GoogleAPIKey() string {
	if key := os.Getenv("GOOGLE_API_KEY"); key != "" {
		return key
	}
	return c.Google.APIKey
}

// Dialect returns the database driver name
func (c *Configuration) Dialect() string {
	if driver := os.Getenv("DB_DRIVER"); driver != "" {
		return driver
	}
	return c.Database.Driver
}

// DBHost returns database Host, "localhost" by default
func (c *Configuration) DBHost() string {
	if host := os.Getenv("DB_HOST"); host != "" {
		return host
	}
	return c.Database.Postgres.Host
}

// DBPort returns database Port
func (c *Configuration) DBPort() int {
	if port := os.Getenv("DB_PORT"); port != "" {
		port, _ := strconv.Atoi(port)
		return port
	}
	return c.Database.Postgres.PORT
}

// DBName returns database name
func (c *Configuration) DBName() string {
	if DBName := os.Getenv("DB_NAME"); DBName != "" {
		return DBName
	}
	return c.Database.Postgres.Dbname
}

// DBUser returns database User
func (c *Configuration) DBUser() string {
	if DBUser := os.Getenv("DB_USER"); DBUser != "" {
		return DBUser
	}
	return c.Database.Postgres.User
}

// DBPass returns database Password
func (c *Configuration) DBPass() string {
	if DBPass := os.Getenv("DB_PASS"); DBPass != "" {
		return DBPass
	}
	return c.Database.Postgres.Password
}
