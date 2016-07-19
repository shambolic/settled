if [ $1 = "post" ]
then
  d=$(date +%y-%m-%d" "%H:%S)
  echo "date is:  $d"
  curl -i  -H "Content-Type: application/json" -d \
    '{"firstName" :"Chris", 
    "lastName": "Froome", 
      "username": "FroomDoggy", 
        "status": "Active", 
          "email": "chris.froome@gmail.com",
          "createdAt" : "'"$d"'" 
  }' \
         http://localhost:3001/users
elif  [ $1 = "get" ]
then
  curl -i  http://localhost:3001/users
elif [ $1 = "delete" ]
then
  curl -i -X DELETE http://localhost:3001/users/$2
elif [ $1 = "put" ]
then
  curl -i \
  -H  "Content-Type: application/json" \
    -X PUT  -d  '{ 
  "username": "Put Username - CURL",
  "firstName": "Purt Firstname - Curl!"
  
}'  http://localhost:3001/users/$2 
else
  echo "invalid arguments.  usage: get, put, delete ID"
fi
  
  
#