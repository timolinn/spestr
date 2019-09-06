package middlewares

import (
	"context"
	"fmt"

	"github.com/gin-gonic/gin"
)

func ResetRequest() gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx, cancel := context.WithCancel(c)
		c.Request.WithContext(ctx)
		defer cancel()

		ch := make(chan struct{})
		go func() {
			c.Next()
			ch <- struct{}{}
		}()
		select {
		case <-ch:
			fmt.Println("Just done............>>>>>>>>.......")
			return
		case <-ctx.Done():
			panic("Context expired >>>>>>>>>>>>>>>>>")
		default:
			fmt.Println("checked ......>>")
		}
	}
}
