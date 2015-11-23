#!/usr/bin/python

import sqlalchemy
from sqlalchemy.ext import declarative


ENGINE = sqlalchemy.create_engine('sqlite:///:memory:', echo=True)
BASE = declarative.declarative_base()
GetSession = sqlalchemy.orm.sessionmaker(bind=ENGINE)


class Listing(BASE):
  __tablename__ = 'listings'

  id = sqlalchemy.Column(sqlalchemy.Integer, primary_key=True)
  user = sqlalchemy.Column(sqlalchemy.String)
  title = sqlalchemy.Column(sqlalchemy.String(140))
  description = sqlalchemy.Column(sqlalchemy.String(1024))
  expiration = sqlalchemy.Column(sqlalchemy.String)
  x = sqlalchemy.Column(sqlalchemy.Float)
  y = sqlalchemy.Column(sqlalchemy.Float)

  def ToDict(self):
    return {
        'id': self.id,
        'user': self.user,
        'title': self.title,
        'description': self.description,
        'expiration': self.expiration,
        'location': {
            'x': self.x,
            'y': self.y,
        },
    }


class Comment(BASE):
  __tablename__ = 'comments'

  id = sqlalchemy.Column(sqlalchemy.Integer, primary_key=True)
  listing_id = sqlalchemy.Column(sqlalchemy.Integer, sqlalchemy.ForeignKey('listings.id'),
                                 nullable=False)
  user = sqlalchemy.Column(sqlalchemy.String)
  comment = sqlalchemy.Column(sqlalchemy.String(140))

  def ToDict(self):
    return {
        'id': self.id,
        'user': self.user,
        'comment': self.comment,
    }


BASE.metadata.create_all(ENGINE)
