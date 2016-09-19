FROM python:3.5.2

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY . /usr/src/app

RUN pip install -r requirements.txt

EXPOSE 3000

CMD [ "python","flask_app.py"]
