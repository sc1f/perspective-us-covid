FROM perspective/python3

# Install Python development library
RUN apt-get update
RUN apt-get -y install python3.7-dev 

# Add server source
ADD ./perspective_server /opt/perspective_server
WORKDIR /opt/perspective_server
RUN pip install -r requirements.txt

CMD python3.7 server.py
