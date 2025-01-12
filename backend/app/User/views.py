from flask import Blueprint, request, jsonify, render_template, redirect, url_for
from datetime import datetime
from sqlalchemy.orm import joinedload


from app.models.User import User, Schedule
from app.models.Auth import UserAcc
from app.extensions import db
import json

user = Blueprint('user', __name__, template_folder='templates')


@user.route('/users', methods=['GET'])
def get_users():
    start_query = request.args.get('start')
    end_query = request.args.get('end')
    
    start_query = start_query.split('.')[0]  # Удаляем миллисекунды
    end_query = end_query.split('.')[0]
    if start_query.endswith('Z'):
        start_query = start_query[:-1]  # Удаляем суффикс 'Z'
    if end_query.endswith('Z'):
        end_query = end_query[:-1]  # Удаляем суффикс 'Z'
    start_query = datetime.fromisoformat(start_query)
    end_query = datetime.fromisoformat(end_query)

    active_accs = UserAcc.query.options(joinedload(UserAcc.user)).filter_by(isActive=True).all()
    users = [acc.user for acc in active_accs if acc.user]


    # Фильтруем расписания по году и месяцу
    filtered_users = []
    for user in users:
        user_schedule = user.schedule

        # Фильтруем расписания по дате
        user_schedule = [s for s in user_schedule if start_query <= s.date < end_query]
        
        projects = user.projects
        

        filtered_users.append({
            'id': user.id,
            'name': user.name,
            'prefix': UserAcc.query.filter_by(user_id=user.id).first().prefix,
            'schedule': [s.to_dict() for s in user_schedule],
            'projects': [{'id': project.id, 'name': project.name} for project in projects]
        })

    return jsonify(filtered_users)


@user.route('/users_list', methods=['GET'])
def get_users_list():
    # Пример добавления пользователей
    # operators = ['Оператор1', 'Оператор10', 'Оператор101', 'Оператор102', 'Оператор103', 'Оператор104', 'Оператор105', 'Оператор106', 'Оператор107', 'Оператор108', 'Оператор109', 'Оператор11', 'Оператор110', 'Оператор111', 'Оператор112', 'Оператор113', 'Оператор114', 'Оператор115', 'Оператор116', 'Оператор117', 'Оператор12', 'Оператор13', 'Оператор14', 'Оператор15', 'Оператор16', 'Оператор17', 'Оператор18', 'Оператор19', 'Оператор2', 'Оператор20', 'Оператор21', 'Оператор22', 'Оператор23', 'Оператор24', 'Оператор25', 'Оператор26', 'Оператор27', 'Оператор28', 'Оператор29', 'Оператор3', 'Оператор30', 'Оператор31', 'Оператор39', 'Оператор4', 'Оператор40', 'Оператор41', 'Оператор42', 'Оператор43', 'Оператор44', 'Оператор45', 'Оператор46', 'Оператор47', 'Оператор48', 'Оператор49', 'Оператор5', 'Оператор51', 'Оператор52', 'Оператор53', 'Оператор54', 'Оператор59', 'Оператор6', 'Оператор60', 'Оператор61', 'Оператор62', 'Оператор63', 'Оператор64', 'Оператор65', 'Оператор66', 'Оператор67', 'Оператор68', 'Оператор69', 'Оператор7', 'Оператор70', 'Оператор71', 'Оператор72', 'Оператор73', 'Оператор74', 'Оператор75', 'Оператор76', 'Оператор77', 'Оператор78', 'Оператор79', 'Оператор8', 'Оператор88', 'Оператор89', 'Оператор9', 'Оператор90', 'Оператор91', 'Оператор92', 'Оператор93', 'Оператор94', 'Оператор95', 'Оператор97', 'Оператор99']
    
    # for operator in operators:
    #     if not User.query.filter_by(name=operator).first():
    #         print(operator)
    #         new_operator = User(name=operator)
    #         db.session.add(new_operator)
    #         db.session.commit()
    #         print("Successfully added new operator")
    # Получаем всех пользователей
    users = User.query.all()

    # Формируем список с ID и именами пользователей
    users_list = [{'id': user.id, 'name': user.name} for user in users]

    return jsonify(users_list)

@user.route('/users', methods=['POST'])
def add_users():
    if request.method == 'POST':
        try:
            # Получаем данные из запроса
            data = request.json
            
            # Извлекаем информацию о пользователе
            name = data.get('name')      

            # Проверяем, что все необходимые данные присутствуют
            if not name:
                return jsonify({'error': 'Все поля (name) обязательны'}), 400

            # Создаем нового пользователя
            new_user = User(name=name)
            
            # Добавляем пользователя в сессию
            db.session.add(new_user)
            db.session.commit()

            return jsonify({'message': 'Пользователь успешно добавлен'}), 200
        except Exception as e:
            print(f'Ошибка при добавлении пользователя: {str(e)}')
            db.session.rollback()
            return jsonify({'error': 'Произошла ошибка при добавлении пользователя'}), 500

@user.route('/user/<name>', methods=['GET'])
def get_user(name):
    user = User.query.filter_by(name=name).first()
    if user is not None:
        return jsonify(user.to_dict())
    return jsonify({'error': 'User not found'}), 404

@user.route('/user/<username>/schedule', methods=['POST'])
def update_schedule(username):
    try:
        # Получаем данные из запроса
        data = request.json
        
        # Найти пользователя по имени пользователя
        user = User.query.filter_by(name=username).first()
        if not user:
            return jsonify({'error': 'Пользователь не найден'}), 404

        # # Получаем все существующие расписания пользователя
        # existing_schedules = Schedule.query.filter_by(user_id=user.id).all()

        # Обрабатываем каждую запись из данных
        for item in data.get('schedule', []):
            # Обработка даты для удаления миллисекунд и суффикса 'Z'
            date_str = item['date'].split('.')[0]  # Удаляем миллисекунды
            if date_str.endswith('Z'):
                date_str = date_str[:-1]  # Удаляем суффикс 'Z'
            date = datetime.fromisoformat(date_str)
            
            # Определяем тип расписания

            if shift_type == 'Выходной':
                # Удаляем запись для этой даты и пользователя
                schedule_to_delete = Schedule.query.filter_by(date=date, user_id=user.id).first()
                if schedule_to_delete:
                    db.session.delete(schedule_to_delete)
            else:
                # Обновляем или добавляем запись
                existing_schedule = Schedule.query.filter_by(date=date, user_id=user.id).first()
                if existing_schedule:
                    # Обновляем существующую запись
                    existing_schedule.type = shift_type
                    existing_schedule.breaks = json.dumps(item.get('breaks', []))
                else:
                    # Добавляем новую запись
                    new_schedule = Schedule(
                        date=date,
                        type=shift_type,
                        breaks=json.dumps(item.get('breaks', [])),
                        user_id=user.id
                    )
                    db.session.add(new_schedule)
        
        db.session.commit()

        return jsonify({'message': 'Расписание успешно обновлено'}), 200
    except Exception as e:
        print(f'Ошибка при обновлении расписания: {str(e)}')
        db.session.rollback()
        return jsonify({'error': 'Произошла ошибка при обновлении расписания'}), 500