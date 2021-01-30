we experienced that web apps could reference their own versions of fonts our app uses

in some cases this broke DAWN for example, special characters began to display incorrectly

in order to avoid this situation, we're namespacing our fonts with the 'DAWN-' prefix

the rename function of the Typelite application (http://www.cr8software.net/typex.html) was used
to accomplish this initially
