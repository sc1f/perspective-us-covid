FROM perspective/python3

# Install Python development library
RUN apt-get -y python3.7-dev 

# Add server source
ADD ./perspective_server /opt/perspective_server
WORKDIR /opt/perspective_server
RUN pip install -r requirements.txt

CMD python3.7 server.py
