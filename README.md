# DP-Project-2

## Endpoint Detection and Response

### Project Overview
Our system keeps users protected from potentially malicious files by scanning them using our cloud infrastructure.

### Functional Requirements
- The client lets the user scan a given file, sending info about it to the cloud
- The cloud infrastructure then processes the incoming messages and returns a verdict for the given file (clean / infected)

### Technologies
- File info will be stored in a noSQL database (mongoDB)
- Cloud infrastructure components communicate using a message broker
- Cloud components will be containerized using Docker
