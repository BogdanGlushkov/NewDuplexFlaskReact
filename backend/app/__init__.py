from flask import Flask
from .extensions import db, bcrypt
from config import Config
from flask_cors import CORS
from flask_jwt_extended import JWTManager

from app.models.Auth import Role, UserAcc
from app.models.User import User

from .User.views import user as user_blueprint
from .Project.views import project as project_blueprint
from .Auth.views import auth as auth_blueprint

import os
from dotenv import load_dotenv

load_dotenv()


def create_app():
    app = Flask(__name__)
    CORS(app, resources={r"/api/*": {"origins": "http://olegperm.fvds.ru"}})
    app.config.from_object(Config)
    
    jwt = JWTManager(app)
    db.init_app(app)
    bcrypt.init_app(app)

    # 
    with app.app_context():
        db.create_all()
        
        # Создаем начальные данные, если их нет
        admin_role_name = 'admin'
        admin_role = Role.query.filter_by(name=admin_role_name).first()
        if not admin_role:
            admin_role = Role(name=admin_role_name)
            user_role = Role(name='user')
            db.session.add(admin_role)
            db.session.add(user_role)
            db.session.commit()

        # Проверьте наличие администратора
        if not UserAcc.query.filter_by(role_id=admin_role.id).first():
            hashed_password = bcrypt.generate_password_hash(os.environ.get('ROOT_SECRET_KEY')).decode('utf-8')
            admin_user = UserAcc(username='root', prefix='Администратор', password=hashed_password, role_id=admin_role.id)
            db.session.add(admin_user)
            db.session.commit()
            
        # Пример добавления пользователей
        operators = ['Vizor2', 'Оператор1', 'Оператор11', 'Оператор12', 'Оператор13', 'Оператор20', 'Оператор28', 'Оператор39', 'Оператор4', 'Оператор5', 'Оператор52', 'Оператор59', 'Оператор60', 'Оператор7', 'Оператор70', 'Оператор72', 'Оператор78', 'Оператор79', 'Оператор8', 'Оператор94', 'Vizor', 'Администратор', 'Оператор101', 'Оператор103', 'Оператор111', 'Оператор115', 'Оператор117', 'Оператор44', 'Оператор45', 'Оператор46', 'Оператор49', 'Оператор53', 'Оператор74', 'Оператор75', 'Оператор76', 'Оператор89', 'Оператор91', 'Оператор104', 'Оператор19', 'Оператор77', 'Оператор9', 'Оператор64', 'Оператор10', 'Оператор107', 'Оператор2', 'Оператор66', 'Оператор93', 'super123', 'Оператор54', 'Оператор6', 'Оператор116', 'Оператор114', 'Оператор16']

        for operator in operators:
            if not User.query.filter_by(name=operator).first():
                print(operator)
                new_operator = User(name=operator)
                db.session.add(new_operator)
                db.session.commit()
                print("Successfully added new operator")
    # 

    app.register_blueprint(user_blueprint)
    app.register_blueprint(project_blueprint)
    app.register_blueprint(auth_blueprint)

    return app
