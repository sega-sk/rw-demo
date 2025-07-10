@@ .. @@
               onClick={() => navigate('/favorites')}
               className="text-yellow-400 hover:text-yellow-300 transition-colors font-inter hover:underline"
             >
               Your Favorites
             </button>
+            <span className="text-gray-600">•</span>
+            <button
+              onClick={() => navigate('/memorabilia')}
+              className="text-yellow-400 hover:text-yellow-300 transition-colors font-inter hover:underline"
+            >
+              Memorabilia
+            </button>
+            <span className="text-gray-600">•</span>
+            <button
+              onClick={() => navigate('/merchandise')}
+              className="text-yellow-400 hover:text-yellow-300 transition-colors font-inter hover:underline"
+            >
+              Merchandise
+            </button>
           </div>