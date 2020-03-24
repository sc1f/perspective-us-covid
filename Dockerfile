FROM perspective/python3_manylinux2014

# Add server source
ADD ./perspective_server /opt/perspective_server
WORKDIR /opt/perspective_server

RUN pip install -r /tmp/requirements.txt

CMD python3.7 server.py
