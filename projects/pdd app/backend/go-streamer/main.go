package main

import (
	"net/http"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

type SignalPacket struct {
	PatientID string    `json:"patient_id"`
	Source    string    `json:"source"`
	Values    []float64 `json:"values"`
	Timestamp time.Time `json:"timestamp"`
}

func main() {
	r := gin.New()

	// Global Recovery & Logger Middleware
	r.Use(gin.Recovery())
	r.Use(gin.Logger())

	// Enable CORS for all origins
	r.Use(cors.Default())

	// High-speed health check
	r.GET("/api/go/ping", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status": "Operational",
			"engine": "Go/Gin High-Speed Link",
		})
	})

	// High-concurrency binary-compatible endpoint
	r.POST("/api/go/stream", func(c *gin.Context) {
		var packet SignalPacket
		if err := c.ShouldBindJSON(&packet); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"received": len(packet.Values),
			"at": time.Now().Format(time.RFC3339),
		})
	})

	r.Run(":8081")
}
