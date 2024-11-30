from flask import jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token, verify_jwt_in_request
from .models import db, User, Category, Transaction
from werkzeug.security import generate_password_hash, check_password_hash
import datetime

def register_routes(app):

    @app.route('/register', methods=['POST'])
    def register():
        data = request.get_json()
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        user_type = data.get('type', 'base')

        # Проверка на существующий username
        if User.query.filter_by(username=username).first():
            return jsonify({"msg": "Username already exists"}), 400
        
        if User.query.filter_by(email=email).first():
            return jsonify({"msg": "Email already exists"}), 400

        hashed_password = generate_password_hash(password, method='pbkdf2:sha256:600000')
        new_user = User(username=username, email=email, password=hashed_password, type=user_type)

        db.session.add(new_user)
        db.session.commit()

        # Генерация токена для нового пользователя
        access_token = create_access_token(identity=str(new_user.id))

        return jsonify({
            "msg": "User created successfully",
            "token": access_token
        }), 201

    @app.route('/login', methods=['POST'])
    def login():
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')

        user = User.query.filter_by(username=username).first()

        if not user or not check_password_hash(user.password, password):
            return jsonify({"msg": "Invalid credentials"}), 401

        access_token = create_access_token(identity=str(user.id))
        return jsonify(token=access_token)

   
   
    @app.route('/categories/<int:category_id>/delete', methods=['DELETE'])
    @jwt_required()
    def delete_category(category_id):
        category = Category.query.get(category_id)
        if not category:
            return jsonify({"msg": "Category not found"}), 404

        user_id = get_jwt_identity()

        if int(category.user_id) != int(user_id):
            return jsonify({"msg": "You are not authorized to delete this category"}), 403

        db.session.delete(category)
        db.session.commit()

        return jsonify({"msg": "Category deleted successfully"}), 200
   
    @app.route('/categories', methods=['GET', 'POST'])
    @jwt_required()
    def manage_categories():       
        if request.method == 'POST':
            data = request.get_json()
            name = data.get('name')
            description = data.get('description')
            
            if not name or not description:
                return jsonify({"msg": "Name and description are required"}), 422
            
            # Пример дополнительной валидации
            existing_category = Category.query.filter_by(name=name, user_id=get_jwt_identity()).first()
            if existing_category:
                return jsonify({"msg": "Category with this name already exists"}), 422
            
            user_id = get_jwt_identity()  # Получаем ID пользователя из токена
            new_category = Category(name=name, description=description, user_id=user_id)
            db.session.add(new_category)
            db.session.commit()

            return jsonify({"msg": "Category added successfully"}), 201

        elif request.method == 'GET':
            user_id = get_jwt_identity()  # Получаем ID пользователя из токена
            categories = Category.query.filter_by(user_id=user_id).all()
            categories.extend(Category.query.filter_by(user_id=None).all())


            categories_dict = [{"id": category.id, "name": category.name, "description": category.description, "user_id": category.user_id} for category in categories]
            return jsonify(categories_dict), 200
            
    @app.route('/transactions/<int:category_id>/delete', methods=['DELETE'])
    @jwt_required()
    def delete_transaction(category_id):
        transaction = Transaction.query.get(category_id)
        if not transaction:
            return jsonify({"msg": "Transaction not found"}), 404

        user_id = get_jwt_identity()
        if int(transaction.user_id) != int(user_id):
            return jsonify({"msg": "You are not authorized to delete this transaction"}), 403

        db.session.delete(transaction)
        db.session.commit()

        return jsonify({"msg": "Transaction deleted successfully"}), 200
    

    @app.route('/transactions', methods=['GET', 'POST'])
    @jwt_required()
    def manage_transactions():
        if request.method == 'POST':
            data = request.get_json()
            amount = data.get('amount')
            description = data.get('description')
            type_ = data.get('type')
            category_id = data.get('category_id')
            
            user_id = get_jwt_identity()  # Получаем ID пользователя из токена
        
            new_transaction = Transaction(
                amount=amount,
                description=description,
                type=type_,
                category_id=category_id,
                user_id=user_id,
                # created_at=datetime.datetime.utcnow().date(),
                # date=datetime.datetime.utcnow()
            )
            db.session.add(new_transaction)
            db.session.commit()

            return jsonify({"msg": "Transaction added successfully"}), 201
        elif request.method == 'GET':
            user_id = get_jwt_identity()  # Получаем ID пользователя из токена
            transactions = Transaction.query.filter_by(user_id=user_id).all()
            transactions_dict = [{"id": transaction.id, "amount": transaction.amount, "description": transaction.description, "type": transaction.type, "created_at": transaction.created_at,"category_id": transaction.category_id, "date": transaction.date, "category_name": Category.query.get(transaction.category_id).name if transaction.category_id else "No category"} for transaction in transactions]
            return jsonify(transactions_dict), 200

    @app.route('/transactions/<int:id>/update', methods=['PUT'])
    @jwt_required()
    def update_transaction(id):
        data = request.get_json()
        amount = data.get('amount')
        description = data.get('description')
        type_ = data.get('type')
        category_id = data.get('category_id')

        transaction = Transaction.query.get(id)

        if not transaction:
            return jsonify({"msg": "Transaction not found"}), 404

        if int(transaction.user_id) != int(get_jwt_identity()):
            return jsonify({"msg": "You are not authorized to update this transaction"}), 403

        transaction.amount = amount
        transaction.description = description
        transaction.type = type_
        transaction.category_id = category_id
        transaction.date = datetime.datetime.utcnow() # Обновляем дату

        db.session.commit() 

        return jsonify({"msg": "Transaction updated successfully"}), 200
    
    @app.route('/categories/<int:id>/update', methods=['PUT'])
    @jwt_required()
    def update_category(id):
        data = request.get_json()
        name = data.get('name')
        description = data.get('description')

        category = Category.query.get(id)

        if not category:
            return jsonify({"msg": "Category not found"}), 404

        if int(category.user_id) != int(get_jwt_identity()):
            return jsonify({"msg": "You are not authorized to update this category"}), 403

        category.name = name
        category.description = description

        db.session.commit()

        return jsonify({"msg": "Category updated successfully"}), 200



