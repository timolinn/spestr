package fastdotcom

// NetworkStatus represents the summary
// of the tested network
type NetworkStatus struct {
	Upload   string
	Download string
	Latency  struct {
		Loaded   string
		Unloaded string
	}
}

// FastDotCom represents all the data
// returned from fast.com
type FastDotCom struct {
	Network NetworkStatus
	Client  string
	Servers string
}

func (fdcm FastDotCom) RunSpeedTest() (FastDotCom, error) {

}
