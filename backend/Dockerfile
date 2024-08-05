FROM python:3.8.10-slim

COPY req.txt req.txt
RUN pip install -r req.txt

COPY . .

CMD [ "python", "run.py" ]