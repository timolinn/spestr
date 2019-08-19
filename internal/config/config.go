package config

import (
	"errors"
	"fmt"
	"io/ioutil"

	"gopkg.in/yaml.v2"

	log "github.com/sirupsen/logrus"
	"github.com/timolinn/spestr/internal/util"
)

// Configuration is the general application
// configuration settings
type Configuration struct {
	Google struct {
		APIKey string `yaml:"apiKey"`
	}
	Token    string `yaml:"token"`
	Postgres *PostgresConfig
}

// PostgresConfig is the database config
type PostgresConfig struct {
	User     string `yaml:"user"`
	Dbname   string `yaml:"dbname"`
	Password string `yaml:"password"`
	PORT     string `yaml:"port"`
}

// InitLogger configure the logger
func InitLogger(debug bool) {
	log.SetFormatter(&log.TextFormatter{
		FullTimestamp: true,
	})

	if debug == true {
		log.SetLevel(log.DebugLevel)
	} else {
		log.SetLevel(log.InfoLevel)
	}
}

// New creates a new configuration
func New() *Configuration {
	cfg := new(Configuration)
	err := cfg.SetValuesFromFile("spestr.yml")
	if err != nil {
		log.Fatalln("Config file not found!")
	}
	fmt.Println(cfg.Postgres)
	fmt.Println(cfg.Google)
	return cfg
}

// SetValuesFromFile reads a yaml config file nad sets
// the values to the config setting
func (c *Configuration) SetValuesFromFile(fileName string) error {
	if !util.Exists(fileName) {
		return errors.New(fmt.Sprintf("config file not found: \"%s\"", fileName))
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
