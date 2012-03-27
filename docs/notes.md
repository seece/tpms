Some random notes
=================

The config file
---------------

tpms
	singleuser
		Uses a hard coded user without login, useful for debug purposes. Don't use with release version.

The url format
--------------

/					redirect to /compo/view/all
/compo/view/:id
/compo/view/all 	the default view
/compo/create/ 		GET: the compo submit form
					POST: parse compo submit data
/entry/view/:id		view single entry
/entry/submit		entry submit form
/admin/login		GET: show login form
					POST: parse login data

