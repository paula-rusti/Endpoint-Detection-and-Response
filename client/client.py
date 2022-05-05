import PySimpleGUI as sg
import requests
import magic

def upload_file(path: str):

    with open(path, "rb") as file:
        to_upload = {"file": file}
        file_type = magic.from_file(path)
        print(file_type)

        headers = {"file_type": file_type}

        response = requests.post(url="http://0.0.0.0:3000/file_scan", files=to_upload, headers=headers)

        print(response.text)

def device_status():
    response = requests.get(url="localhost:20000/status", params={"deviceid": "aaa"})

    print(response.text)

def main_loop():
    layout = [[sg.Text('Enter file path:')],      
                 [sg.InputText()],      
                 [sg.Submit(), sg.Cancel()],
                 [sg.Button("Device status")]]      

    window = sg.Window('Window Title', layout)    

    while True:
        event, values = window.read()    
        print(values)

        if event == sg.WIN_CLOSED:
            break
        elif event == "Submit":
            print("Submit pressed")
            upload_file(values[0])

        elif event == "Cancel":
            print("Cancel pressed")
        elif event == "Device status":
            print("Device status pressed")
            device_status()
        
        
    window.close()

if __name__ == "__main__":
    main_loop()
