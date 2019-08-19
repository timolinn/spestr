package isp

type IspModel struct {
	Name           string
	ConnectionType string // 2g/3g/4g
	ServerLocation string
	RegionName     string
	RegionCode     string
	Timezone       string
	Query          string
	City           string
	Country        string
	CountryCode    string
}
