from app.extensions import db

class Metrics(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    Data = db.Column(db.DateTime, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    user = db.relationship('User', backref=db.backref('metrics', lazy=True))
    StatusTimeInPlace = db.Column(db.Time)
    StatusTimeBusy = db.Column(db.Time)
    StatusTimeBreak = db.Column(db.Time)
    StatusTimeGone = db.Column(db.Time)
    StatusTimeNotAvailable = db.Column(db.Time)
    PercentInPlace = db.Column(db.Float)
    CountIncoming = db.Column(db.Integer)
    LenghtIncoming = db.Column(db.Time)
    IncomingAVG = db.Column(db.Time)
    CountOutgoing = db.Column(db.Integer)
    LenghtOutgoing = db.Column(db.Time)
    OutgoingAVG = db.Column(db.Time)
    CountMissed = db.Column(db.Integer)
    
    def __repr__(self):
        return f'<Metrics {self.Data}, {self.user_id}>'