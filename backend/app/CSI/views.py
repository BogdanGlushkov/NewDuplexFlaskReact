import os
from flask import Blueprint, request, jsonify

from app.models.User import User
from app.models.CSI import Metrics

from app.extensions import db, bcrypt
from datetime import datetime, time


csi = Blueprint('csi', __name__, template_folder='templates')

@csi.route('/add_metrika', methods=['POST'])
def add_metrika():
    if not request.headers.get("Authorization"):
        return jsonify({"message": "Authorization header is missing"}), 401
    
    if bcrypt.generate_password_hash(request.headers.get("Authorization")).decode('utf-8') != bcrypt.generate_password_hash(os.environ.get('CROSS_SERVER_INTEGRATION_KEY')).decode('utf-8'):
        return jsonify({'message': 'Access forbidden: Invalid CSI password'}), 403

    response_data = request.get_json()
    if not response_data:
        return jsonify({"error": "Invalid or missing JSON data"}), 404
    
    for part_json in response_data.get("metriks", []):
        try:
            date = part_json.get("Date")
            user = part_json.get("Operator")
            if not date or not user:
                return jsonify({"error": "Missing required fields: Date or Operator"}), 404
            
            if not User.query.filter_by(name=user).first():
                print(user)
                new_operator = User(name=user)
                db.session.add(new_operator)
                db.session.commit()
                print("Successfully added new operator")
            
            user = db.session.execute(db.select(User.id, User.name).filter(User.name == user)).all()
            user_id = user.id
            
            this_metrica = db.session.execute(db.select(Metrics).filter(Metrics.operator_id == user_id).filter(Metrics.Data == date)).all()
            
            if not this_metrica:
                StatusTimeInPlace = datetime.strptime(part_json.get("StatusTimeInPlace"), '%H:%M:%S').time()
                StatusTimeBusy = datetime.strptime(part_json.get("StatusTimeBusy"), '%H:%M:%S').time()
                StatusTimeBreak = datetime.strptime(part_json.get("StatusTimeBreak"), '%H:%M:%S').time()
                StatusTimeGone = datetime.strptime(part_json.get("StatusTimeGone"), '%H:%M:%S').time()
                StatusTimeNotAvailable = datetime.strptime(part_json.get("StatusTimeNotAvailable"), '%H:%M:%S').time()
                
                PercentInPlace = part_json.get("PercentInPlace")
                
                if isinstance(part_json.get("CountIncoming"), int): 
                    CountIncoming = part_json.get("CountIncoming")
                else: 
                    CountIncoming = 0
                
                if isinstance(part_json.get("LenghtIncoming"), str): 
                    LenghtIncoming = datetime.strptime(part_json.get("LenghtIncoming"), '%H:%M:%S').time()
                else: 
                    LenghtIncoming = time(00, 00, 00)
                    
                if isinstance(part_json.get("IncomingAVG"), str): 
                    IncomingAVG = datetime.strptime(part_json.get("IncomingAVG"), '%H:%M:%S').time()
                else: 
                    IncomingAVG = time(00, 00, 00)
                    
                if isinstance(part_json.get("CountOutgoing"), int): 
                    CountOutgoing = part_json.get("CountOutgoing")
                else: 
                    CountOutgoing = 0
                    
                if isinstance(part_json.get("LenghtOutgoing"), str): 
                    LenghtOutgoing = datetime.strptime(part_json.get("LenghtOutgoing"), '%H:%M:%S').time()
                else: 
                    LenghtOutgoing = time(00, 00, 00)
                
                if isinstance(part_json.get("OutgoingAVG"), str): 
                    OutgoingAVG = datetime.strptime(part_json.get("OutgoingAVG"), '%H:%M:%S').time()
                else: 
                    OutgoingAVG = time(00, 00, 00)
                    
                if isinstance(part_json.get("CountMissed"), int): 
                    CountMissed = part_json.get("CountMissed")
                else: 
                    CountMissed = 0
            
                NewMetrica = Metrics(Data=date, operator_id=user_id, StatusTimeInPlace=StatusTimeInPlace, StatusTimeBusy=StatusTimeBusy, StatusTimeBreak=StatusTimeBreak,
                                        StatusTimeGone=StatusTimeGone, StatusTimeNotAvailable=StatusTimeNotAvailable, PercentInPlace=PercentInPlace, CountIncoming=CountIncoming,
                                        LenghtIncoming=LenghtIncoming, IncomingAVG=IncomingAVG, CountOutgoing=CountOutgoing, LenghtOutgoing=LenghtOutgoing, OutgoingAVG=OutgoingAVG,
                                        CountMissed=CountMissed)
                db.session.add(NewMetrica)
                db.session.commit()
                print('Экземпляр модели Metrics был успешно добавлен в базу данных')
                
            else:
                print('Экземпляр модели Metrics уже существует')
                    
        except Exception as e:
            return jsonify({"error": str(e)}), 500
        
        

    return jsonify({'message': 'Metriks added successfully'}), 201