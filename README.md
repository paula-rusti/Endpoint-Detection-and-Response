# Endpoint Detection and Response
Second project for the Distribute Programming subject, year 3 semester 2.

### Project Overview
Our system keeps users protected from potentially malicious files by scanning them using our cloud infrastructure.

### Functional Requirements
- The client lets the user scan a given file, sending info about it to the cloud
- The cloud infrastructure then processes the incoming messages and returns a verdict for the given file (clean / infected)
- Each device has a device ID, and the client can know if their device is infected or not based on previous scans from that device ID
- The client can see an overview of scans by date (how many infected files and clean files have been scanned on given date)

### Technologies
- backend: Python with fastAPI
- frontend: Electron JS
- database: mongoDB + Redis Cache
- message broker: rabbitMQ
- Docker

### Setup
Start services locally with:
```
docker-compose up
```
Install Node dependencies:
```
npm install
```
Start the client:
```
npm start
```

### Project Architecture
There are 2 components: Scan Engine and Scans Stats each with its own API.

#### Scan Engine
Gives a verdict to a file based on a dummy logic.
The steps for that are:
- send a POST request to /scan
- file is uploaded using the scan API 
- verdict is given by: file hash (md5) % 3 ({0 -> clean, 1 -> malware, 2 -> PUA}) 
- scan results documents (JSON) are stored in a mongoDB collection
##### File Scan Collection Format
```
{
    _id: string  		// file hash - md5; mongo identifier in this case
    device_id: string   // device id, uniquely identifying a device
    verdict : string    // detection verdict -> {clean, infected, PUA}
}
```
- a Redis cache is used: we first look there if we already have the given file. If not, we insert a new document into the file scan collection

The database can also be queried using an md5 by making a GET request to /scan/{md5}.
The client can get the infection status of their device through a GET request to /device_status/{device_id}. The database is queried for the documents
containing the given device_id, and if there exists at least one with verdict = infected then the client device is considered infected.

#### Scan Stats
For telemetry purposes, after each file scan the results are published on a rabbitMQ queue, which is read by a worker that updates the Scan Stats Collection continuously.
##### Scan Stats Collection Format
```
{
	date: YY-MM-DD   	 // day
	clean_count: int 	 // number of clean files scanned on this day
	infected_count: int  // number of infected files scanned on this day
}
```
- a GET request to /overview gives the client the document corresponding to the current day.
- a GET request to /overview/{date} gives the client the document corresponding to the given day.
- a GET request to /scanned/{file_hash} tells the client if the given file has been scanned before or not.


![Alt text](/architecture.PNG "Architecture")


