import tornado.ioloop
import tornado.web
import os

class MainHandler(tornado.web.RequestHandler):
    def get(self):
        self.write("Hello, world")

def make_app():
    return tornado.web.Application([
        (r"/", MainHandler),
    ])

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app = make_app()
    app.listen(port)
    tornado.ioloop.IOLoop.current().start()