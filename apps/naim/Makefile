all: static/*.html

static/%.html: templates/%.html templates/_*.html
	./buildtemplate.py $< > $@
