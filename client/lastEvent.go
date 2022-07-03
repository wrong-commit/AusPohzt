package main

import (
	"fmt"
	"io/ioutil"
	"os"
)

func (p Parcel) HasNewEvent() (bool, error) {
	filename := getEventFilename(p)
	if _, err := os.Stat(filename); os.IsNotExist(err) {
		fmt.Printf("[%s] No event data exists\n", p.TrackingId)
		os.Create(filename)
		return true, nil
	}

	recordedEvent, err := readFile(filename)
	if err != nil {
		return false, err
	}
	fmt.Printf("[%s] Last Event=<%s>\n", p.TrackingId, recordedEvent)
	return recordedEvent != fmt.Sprint(p.Events[len(p.Events)-1].Id), nil
}

func (p Parcel) WriteNewEvent(event TrackingEvent) error {
	filename := getEventFilename(p)
	file, err := os.OpenFile(filename, os.O_WRONLY, os.ModePerm)
	if err != nil {
		fmt.Printf("[%s] Could not open file <%s> (%s)\n", p.TrackingId, filename, err.Error())
		return err
	}

	newId := fmt.Sprintf("%d", event.Id)
	if _, err := file.WriteString(newId); err != nil {
		return err
	}

	return nil
}

func readFile(filename string) (string, error) {
	file, err := os.OpenFile(filename, os.O_RDONLY, os.ModePerm)
	if err != nil {
		fmt.Printf("Could not open file <%s> (%s)\n", filename, err.Error())
		return "", err
	}

	bytes, err := ioutil.ReadAll(file)
	if err != nil {
		fmt.Printf("Could not read file <%s> (%s)\n", filename, err.Error())
		return "", err
	}

	return string(bytes), nil
}

func getEventFilename(parcel Parcel) string {
	return fmt.Sprintf("/tmp/%s", parcel.TrackingId)
}
