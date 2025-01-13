import os
import json
from flask import Blueprint, request, jsonify

from app.models.User import User
from app.models.CSI import Metrics

from app.extensions import db
from datetime import datetime, time

import logging

logging.basicConfig(level=logging.DEBUG)


csi = Blueprint('csi', __name__, template_folder='templates')

@csi.route('/add_metrika', methods=['POST'])
def add_metrika():
    logging.debug(f"Headers: {request.headers}")
    if not request.headers.get("Authorization"):
        return jsonify({"message": "Authorization header is missing"}), 401
    
    if request.headers.get("Authorization") != os.environ.get('CROSS_SERVER_INTEGRATION_KEY'):
        return jsonify({'message': 'Access forbidden: Invalid CSI password'}), 403

    response_data = request.get_json()
    logging.debug(f"Request data: {response_data}")
    if not response_data:
        return jsonify({"error": "Invalid or missing JSON data"}), 404
    
    response_data = json.loads(response_data)
    
    for part_json in response_data["metriks"]:
        try:
            date = part_json.get("Date")
            user = part_json.get("Operator")
            if not date or not user:
                return jsonify({"error": "Missing required fields: Date or Operator"}), 404
            
            if not User.query.filter_by(name=user).first():
                logging.debug(f"Adding new operator: {user}")
                new_operator = User(name=user)
                db.session.add(new_operator)
                db.session.commit()
                logging.debug("Successfully added new operator")
            
            user = db.session.execute(db.select(User.id, User.name).filter(User.name == user)).first()
            user_id = user[0]
            logging.debug(f"User ID: {user_id}")
            
            this_metrica = db.session.execute(db.select(Metrics).filter(Metrics.user_id == user_id).filter(Metrics.Data == date)).all()
            logging.debug(f"find metrica for user: {this_metrica}")
            
            if not this_metrica:
                logging.debug(f"Adding new metrica for user: {user_id} on date: {date}")
                StatusTimeInPlace = datetime.strptime(part_json.get("StatusTimeInPlace"), '%H:%M:%S').time()
                logging.debug(f"Adding new metrica for {StatusTimeInPlace}")
                StatusTimeBusy = datetime.strptime(part_json.get("StatusTimeBusy"), '%H:%M:%S').time()
                logging.debug(f"Adding new metrica for {StatusTimeBusy}")
                StatusTimeBreak = datetime.strptime(part_json.get("StatusTimeBreak"), '%H:%M:%S').time()
                logging.debug(f"Adding new metrica for {StatusTimeBreak}")
                StatusTimeGone = datetime.strptime(part_json.get("StatusTimeGone"), '%H:%M:%S').time()
                logging.debug(f"Adding new metrica for {StatusTimeGone}")
                StatusTimeNotAvailable = datetime.strptime(part_json.get("StatusTimeNotAvailable"), '%H:%M:%S').time()
                logging.debug(f"Adding new metrica for {StatusTimeNotAvailable}")
                
                
                PercentInPlace = part_json.get("PercentInPlace")
                logging.debug(f"Adding new metrica for {PercentInPlace}")
                
                if isinstance(part_json.get("CountIncoming"), int): 
                    CountIncoming = part_json.get("CountIncoming")
                else: 
                    CountIncoming = 0
                    
                logging.debug(f"Adding new metrica for {CountIncoming}")
                
                if isinstance(part_json.get("LenghtIncoming"), str): 
                    LenghtIncoming = datetime.strptime(part_json.get("LenghtIncoming"), '%H:%M:%S').time()
                else: 
                    LenghtIncoming = time(00, 00, 00)
                
                logging.debug(f"Adding new metrica for {LenghtIncoming}")
                if isinstance(part_json.get("IncomingAVG"), str): 
                    IncomingAVG = datetime.strptime(part_json.get("IncomingAVG"), '%H:%M:%S').time()
                else: 
                    IncomingAVG = time(00, 00, 00)
                
                logging.debug(f"Adding new metrica for {IncomingAVG}")
                if isinstance(part_json.get("CountOutgoing"), int): 
                    CountOutgoing = part_json.get("CountOutgoing")
                else: 
                    CountOutgoing = 0
                
                logging.debug(f"Adding new metrica for {CountOutgoing}")
                if isinstance(part_json.get("LenghtOutgoing"), str): 
                    LenghtOutgoing = datetime.strptime(part_json.get("LenghtOutgoing"), '%H:%M:%S').time()
                else: 
                    LenghtOutgoing = time(00, 00, 00)
                
                logging.debug(f"Adding new metrica for {LenghtOutgoing}")
                if isinstance(part_json.get("OutgoingAVG"), str): 
                    OutgoingAVG = datetime.strptime(part_json.get("OutgoingAVG"), '%H:%M:%S').time()
                else: 
                    OutgoingAVG = time(00, 00, 00)
                
                logging.debug(f"Adding new metrica for {OutgoingAVG}")

                if isinstance(part_json.get("CountMissed"), int): 
                    CountMissed = part_json.get("CountMissed")
                else: 
                    CountMissed = 0

                logging.debug(f"Adding new metrica for {CountMissed}")
                
                logging.debug(f"Adding new metrica for {date}, {user_id}, {StatusTimeInPlace}, {StatusTimeBusy},{StatusTimeBreak},{StatusTimeGone},{StatusTimeNotAvailable},{PercentInPlace},{CountIncoming},{LenghtIncoming},{IncomingAVG},{CountOutgoing},{LenghtOutgoing},{OutgoingAVG}, {CountMissed}")

                NewMetrica = Metrics(Data=date,
                                    user_id=user_id,
                                    StatusTimeInPlace=StatusTimeInPlace,
                                    StatusTimeBusy=StatusTimeBusy,
                                    StatusTimeBreak=StatusTimeBreak,
                                    StatusTimeGone=StatusTimeGone,
                                    StatusTimeNotAvailable=StatusTimeNotAvailable,
                                    PercentInPlace=PercentInPlace,
                                    CountIncoming=CountIncoming,
                                    LenghtIncoming=LenghtIncoming,
                                    IncomingAVG=IncomingAVG,
                                    CountOutgoing=CountOutgoing,
                                    LenghtOutgoing=LenghtOutgoing,
                                    OutgoingAVG=OutgoingAVG,
                                    CountMissed=CountMissed)
                try:
                    db.session.add(NewMetrica)
                    db.session.commit()
                    logging.debug("Метрика успешно добавлена")
                except Exception as e:
                    db.session.rollback()  # откатываем изменения в случае ошибки
                    logging.debug(f"Ошибка при добавлении метрики: {str(e)}")
                
            else:
                logging.debug('Экземпляр модели Metrics уже существует')
                    
        except Exception as e:
            return jsonify({"error": str(e)}), 500
        
        

    return jsonify({'message': 'Metriks added successfully'}), 201