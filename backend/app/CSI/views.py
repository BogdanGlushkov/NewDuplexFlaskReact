import os
import json
from flask import Blueprint, request, jsonify

from app.models.User import User
from app.models.CSI import Metrics
from app.models.Auth import UserAcc, Role

from app.extensions import db, bcrypt
from datetime import datetime, time, timedelta

import logging

logging.basicConfig(level=logging.DEBUG)


csi = Blueprint('csi', __name__, template_folder='templates')

@csi.route('/add_metrika', methods=['POST'])
def add_metrika():
    if not request.headers.get("Authorization"):
        logging.debug("Authorization header is missing, 401")
        return jsonify({"message": "Authorization header is missing"}), 401
    
    if request.headers.get("Authorization") != os.environ.get('CROSS_SERVER_INTEGRATION_KEY'):
        logging.debug("Access forbidden: Invalid CSI password, 403")
        return jsonify({'message': 'Access forbidden: Invalid CSI password'}), 403

    response_data = request.get_json()
    if not response_data:
        logging.debug("Invalid or missing JSON data, 404")
        return jsonify({"error": "Invalid or missing JSON data"}), 404
    
    response_data = json.loads(response_data)
    
    for part_json in response_data["metriks"]:
        try:
            date = part_json.get("Date")
            user = part_json.get("Operator")
            if not date or not user:
                logging.debug("Missing required fields: Date or Operator, 404")
                return jsonify({"error": "Missing required fields: Date or Operator"}), 404
            
            if not User.query.filter_by(name=user).first():
                new_operator = User(name=user)
                db.session.add(new_operator)
                db.session.commit()
                logging.debug(f"Successfully added new operator: {user}")
            
            user = db.session.execute(db.select(User.id, User.name).filter(User.name == user)).first()
            user_id = user[0]
            
            this_metrica = Metrics.query.filter_by(user_id=user_id, Data=date).first()
            
            if not this_metrica:
                # logging.debug(f"Adding new metrica for user: {user_id} on date: {date}")
                if isinstance(part_json.get("StatusTimeInPlace"), str): 
                    StatusTimeInPlace = datetime.strptime(part_json.get("StatusTimeInPlace"), '%H:%M:%S').time()
                else: 
                    StatusTimeInPlace = time(00, 00, 00)
                if isinstance(part_json.get("StatusTimeBusy"), str): 
                    StatusTimeBusy = datetime.strptime(part_json.get("StatusTimeBusy"), '%H:%M:%S').time()
                else: 
                    StatusTimeBusy = time(00, 00, 00)
                if isinstance(part_json.get("StatusTimeBreak"), str): 
                    StatusTimeBreak = datetime.strptime(part_json.get("StatusTimeBreak"), '%H:%M:%S').time()
                else: 
                    StatusTimeBreak = time(00, 00, 00)
                if isinstance(part_json.get("StatusTimeGone"), str): 
                    StatusTimeGone = datetime.strptime(part_json.get("StatusTimeGone"), '%H:%M:%S').time()
                else: 
                    StatusTimeGone = time(00, 00, 00)
                if isinstance(part_json.get("StatusTimeNotAvailable"), str): 
                    StatusTimeNotAvailable = datetime.strptime(part_json.get("StatusTimeNotAvailable"), '%H:%M:%S').time()
                else: 
                    StatusTimeNotAvailable = time(00, 00, 00)    
                
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
                except Exception as e:
                    db.session.rollback()
                    logging.debug(f"Ошибка при добавлении метрики: {str(e)} user_id: {user_id}, date: {date}")
                    
        except Exception as e:
            return jsonify({"error": str(e)}), 500
        
        

    return jsonify({'message': 'Metriks added successfully'}), 201

def calculate_monthly_average(start_date, end_date, limit=None):
    start_date = datetime.strptime(start_date, "%Y-%m-%d")
    end_date = datetime.strptime(end_date, "%Y-%m-%d")

    # Базовый запрос
    query = Metrics.query.filter(
        Metrics.Data >= start_date,
        Metrics.Data <= end_date
    )
        
    metrics = query.all()
    
    if not metrics:
        return None
    
    count = 0
    SumCountIncoming = 0
    
    user_data = {}

    for metrika in metrics:
        user_name = metrika.user.name  # Предполагается, что у пользователя есть имя
        if user_name not in user_data:
            user_data[user_name] = {
                "SumCountIncoming": 0,
                "Count": 0
            }

        # Суммируем CountIncoming для пользователя
        if metrika.CountIncoming:
            user_data[user_name]["SumCountIncoming"] += metrika.CountIncoming
            user_data[user_name]["Count"] += 1

    # Рассчитываем средние значения
    result = []
    for user_name, data in user_data.items():
        avg_count_incoming = (
            data["SumCountIncoming"] // data["Count"]
            if data["Count"] > 0 else 0
        )
        result.append({
            "user": user_name,
            "AvgCountIncoming": avg_count_incoming
        })
        
    result.sort(key=lambda x: x["AvgCountIncoming"], reverse=True)

    # Применяем limit, если он указан
    if limit is not None:
        result = result[:limit]

    return result
    

@csi.route('/get_metrika', methods=['GET'])
def get_metrika():
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    limit = request.args.get('limit')
    
    if not start_date or not end_date:
        return jsonify({"error": "Укажите start_date и end_date"}), 401
    
    if limit:
        try:
            limit = int(limit)
            if limit <= 0:
                raise ValueError
        except ValueError:
            return jsonify({"error": "limit должен быть положительным числом"}), 401

    result = calculate_monthly_average(start_date, end_date, limit)

    if result is None:
        return jsonify({"message": "Нет данных за указанный промежуток"}), 404

    return jsonify(result), 201

@csi.route('/add_account', methods=['POST'])
def add_account_CSI():
    if not request.headers.get("Authorization"):
        logging.debug("Authorization header is missing, 401")
        return jsonify({"message": "Authorization header is missing"}), 401
    
    if request.headers.get("Authorization") != os.environ.get('CROSS_SERVER_INTEGRATION_KEY'):
        logging.debug("Access forbidden: Invalid CSI password, 403")
        return jsonify({'message': 'Access forbidden: Invalid CSI password'}), 403

    response_data = request.get_json()
    if not response_data:
        logging.debug("Invalid or missing JSON data, 404")
        return jsonify({"error": "Invalid or missing JSON data"}), 404
    try:
        # response_data
        user_id_inf = response_data["user_id_inf"]
        password = response_data["password"]
        logging.debug(f"Successfully password: {password}")
        if response_data["prefix"]:
            prefix = response_data["prefix"]
        role_name = response_data["role"]
        role = Role.query.filter_by(name=role_name).first()
        
        logging.debug(f"Successfully role: {role}")
        
        login = response_data["login"]
        
        if not User.query.filter_by(name=login).first():
            new_operator = User(name=login)
            try:
                db.session.add(new_operator)
                db.session.commit()
                logging.debug(f"Successfully added new operator: {login}")
            except Exception as e:
                db.session.rollback()
                logging.debug(f"Ошибка при добавлении оператора: {str(e)} login: {login}")
            
                
        user = db.session.execute(db.select(User.id, User.name).filter(User.name == login)).first()
        logging.debug(f"Successfully user: {user}")
        
        user_id = user[0]
        logging.debug(f"Successfully user_id: {user_id}")
        
        isActive = response_data["isActive"]
        logging.debug(f"Successfully isActive: {isActive}")
        logging.debug(f"Successfully user: {user_id_inf}")
        
        user = db.session.execute(db.select(UserAcc.id, UserAcc.username).filter(UserAcc.user_id_inf == user_id_inf)).first()
        
        logging.debug(f"Successfully user: {user}")
        if not user:
            new_user = UserAcc(username=login, password=bcrypt.generate_password_hash(password).decode('utf-8'), user_id_inf=user_id_inf, prefix=prefix, role=role, user_id=user_id if user else None, isActive=isActive)
            try:
                db.session.add(new_user)
                db.session.commit()
                logging.debug(f"Successfully added new account: {login}")
            except Exception as e:
                db.session.rollback()
                logging.debug(f"Ошибка при добавлении аккаунта: {str(e)} login: {login}")
                
        else:
            try:  
                user = UserAcc.query.get(user[0])
                user.username = login
                user.password = bcrypt.generate_password_hash(password).decode('utf-8')
                user.prefix = prefix
                user.user_id = user_id
                user.isActive = isActive
                db.session.commit()
                logging.debug(f"Successfully update user: {user}")
            except Exception as e:
                db.session.rollback()
                logging.debug(f"Ошибка при обновлении аккаунта: {str(e)} login: {user}")
            
    except Exception as e:
            return jsonify({"error": str(e)}), 500
            
    return jsonify({'message': 'Login added successfully'}), 201   


def calculate_hours_for_user(start_date, end_date, user_id):
    start_date = datetime.strptime(start_date.split('T')[0], "%Y-%m-%d")
    end_date = datetime.strptime(end_date.split('T')[0], "%Y-%m-%d")

    # Базовый запрос
    query = Metrics.query.filter(
        Metrics.Data >= start_date,
        Metrics.Data <= end_date,
        Metrics.user_id == user_id
    )
        
    metrics = query.all()
    
    if not metrics:
        return { 'hours': "00:00:00" }
    
    total_seconds = 0

    for metrika in metrics:
        if metrika.StatusTimeInPlace:
            # Преобразуем время в общее количество секунд
            time_obj = metrika.StatusTimeInPlace
            total_seconds += time_obj.hour * 3600 + time_obj.minute * 60 + time_obj.second
            
    total_time = timedelta(seconds=total_seconds)

    hours, remainder = divmod(total_time.seconds, 3600)
    minutes, seconds = divmod(remainder, 60)
    formatted_time = f"{hours:02}:{minutes:02}:{seconds:02}"
    
    # Возвращаем результат
    return { 'hours': formatted_time }

@csi.route('/get_hours', methods=['GET'])
def get_hours():
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    user_id = request.args.get('user_id')
    
    if not start_date or not end_date:
        return jsonify({"error": "Укажите start_date и end_date"}), 401

    result = calculate_hours_for_user(start_date, end_date, user_id)

    if result is None:
        return jsonify({"message": "Нет данных за указанный промежуток"}), 404

    return jsonify(result), 201