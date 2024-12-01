from flask import jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token, verify_jwt_in_request
from .models import db, User, Category, Transaction
from werkzeug.security import generate_password_hash, check_password_hash
import datetime
from sqlalchemy import case

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
    
    @app.route('/dashboard/get-data', methods=['GET'])
    @jwt_required()
    def get_dashboard_data():
        # Retrieve the start and end dates from the query parameters
        start_date_chart = request.args.get('start_date_chart')
        end_date_chart = request.args.get('end_date_chart')
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')

        # Optionally, print out the received dates for debugging        
        user_id = get_jwt_identity()

        # Retrieve categories in a serializable format
        categories = [
            {
                'id': category.id,
                'name': category.name,
                'description': category.description
            }
            for category in Category.query.filter_by(user_id=user_id).all()
        ]
        
        # Filter transactions based on the provided start and end dates
        transactions = [
            {
                'id': transaction.id,
                'amount': transaction.amount,
                'description': transaction.description,
                'category_id': transaction.category_id,
                'category_name': Category.query.get(transaction.category_id).name if transaction.category_id else "No category",
                'created_at': transaction.created_at,
                'type': transaction.type,
                'date': transaction.date,
            }
            for transaction in Transaction.query.filter_by(user_id=user_id).filter(
                Transaction.date >= start_date if start_date else True,
                Transaction.date <= end_date if end_date else True
            ).all()
        ]
        
        # Calculate the total sum based on the date range
        total_sum_income = db.session.query(db.func.sum(
            case(
                (Transaction.type == 'income', Transaction.amount),
                (Transaction.type == 'expense', 0),
                else_=0
            )
        ).filter(
            Transaction.user_id == get_jwt_identity(),
            Transaction.date >= start_date if start_date else True,
            Transaction.date <= end_date if end_date else True
        )).scalar()
        
        total_sum_expense = db.session.query(db.func.sum(
            case(
                (Transaction.type == 'income', 0),
                (Transaction.type == 'expense', Transaction.amount),
                else_=0
            )
        ).filter(
            Transaction.user_id == get_jwt_identity(),
            Transaction.date >= start_date if start_date else True,
            Transaction.date <= end_date if end_date else True
        )).scalar()

        # Calculate the total amount by category
        category_data_income = db.session.query(
            Category.id,
            Category.name,
            db.func.sum(
                case(
                    (Transaction.type == 'income', Transaction.amount),
                    (Transaction.type == 'expense', 0),
                    else_=0
                )
            ).label('total_amount_income')
        ).join(Transaction).filter(
            Transaction.user_id == get_jwt_identity(),
            Transaction.date >= start_date_chart if start_date_chart else True,
            Transaction.date <= end_date_chart if end_date_chart else True
        ).group_by(Category.id).all()
        
        category_data_expense = db.session.query(
            Category.id, 
            Category.name,
            db.func.sum(
                case(
                    (Transaction.type == 'income', 0),
                    (Transaction.type == 'expense', Transaction.amount),
                    else_=0
                )
            ).label('total_amount_expense')
        ).join(Transaction).filter(
            Transaction.user_id == get_jwt_identity(),
            Transaction.date >= start_date_chart if start_date_chart else True,
            Transaction.date <= end_date_chart if end_date_chart else True
        ).group_by(Category.id).all()

        # Prepare chart data
        chart_data_income = []
        for id, category, total_amount_income in category_data_income:
            share = (total_amount_income / total_sum_income) * 100 if total_sum_income != 0 else 0
            chart_data_income.append({
                'id': id,
                'category': category,
                'total_amount_income': total_amount_income,
                'share': round(share, 2)  # Share as a percentage
            })

        chart_data_expense = []
        for id, category, total_amount_expense in category_data_expense:
            share = (total_amount_expense / total_sum_expense) * 100 if total_sum_expense != 0 else 0
            chart_data_expense.append({
                'id': id,
                'category': category,
                'total_amount_expense': total_amount_expense,
                'share': round(share, 2)  # Share as a percentage
            })
        
        total = total_sum_income + total_sum_expense if total_sum_income is not None and total_sum_expense is not None else 0
        i_percent = (total_sum_income / total) * 100 if total != 0 else 0
        e_percent = (total_sum_expense / total) * 100 if total != 0 else 0

        total_data = []
        total_data.append({
            'total_income': total_sum_income,
            "i_percent": round(i_percent, 2),
            'total_expense': total_sum_expense,
            "e_percent": round(e_percent, 2),
            "total": total,
        })
        # Return the response as JSON
        return jsonify({
            "categories": categories,
            "transactions": transactions,
            "total_sum_income": total_sum_income,
            "chart_data_income": chart_data_income,
            "total_sum_expense": total_sum_expense,
            "chart_data_expense": chart_data_expense,
            "chart_data_total": total_data
        }), 200