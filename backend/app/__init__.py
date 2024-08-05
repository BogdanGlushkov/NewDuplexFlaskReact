from flask import Flask
from .extensions import db, bcrypt
from config import Config
from flask_cors import CORS
from flask_jwt_extended import JWTManager

from app.models.Auth import Role, UserAcc

from .User.views import user as user_blueprint
from .Project.views import project as project_blueprint
from .Auth.views import auth as auth_blueprint


def create_app():
    app = Flask(__name__)
    CORS(app)
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
            hashed_password = bcrypt.generate_password_hash('23e21980-b841-442f-bb24-5857914c911a').decode('utf-8')
            admin_user = UserAcc(username='root', prefix='Администратор', password=hashed_password, role_id=admin_role.id)
            db.session.add(admin_user)
            db.session.commit()
    
    # 

    app.register_blueprint(user_blueprint)
    app.register_blueprint(project_blueprint)
    app.register_blueprint(auth_blueprint)

    return app
