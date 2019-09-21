package fastdotcom

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

var speed int

func TestRunSpeed_Test(t *testing.T) {
	f := FastDotCom{}
	t.Run("run internet speed test", func(t *testing.T) {
		dataChan := make(chan int)

		go func() {
			for Kbps := range dataChan {
				if Kbps > 0 {
					speed = int(Kbps)
				}
			}
		}()

		var err error
		f, err = f.RunSpeedTest(dataChan)
		if err != nil {
			t.Error()
			return
		}
	})

	t.Run("check for correct value on FastDotCom.Network.Download", func(t *testing.T) {
		assert.Equal(t, speed, f.Network.Download, "Download speed not set")
	})
}
