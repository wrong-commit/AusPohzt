package main

import (
	"fmt"

	"github.com/gen2brain/beeep"
)

func (p Parcel) Notify(e TrackingEvent) {
	title := fmt.Sprintf("AusPohzt: %s", p.TrackingId)
	var message string
	if e.Type == "delivered" {
		message = fmt.Sprintf("Parcel %s has been delivered", p.TrackingId)
	} else {
		message = fmt.Sprintf("Parcel %s: %s", p.TrackingId, e.Message)
	}
	beeep.Notify(title, message, "")
}
