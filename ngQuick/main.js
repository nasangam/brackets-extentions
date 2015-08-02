/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, $, brackets, window, PathUtils, Mustache, jQuery */

define(function (require, exports, module) {
    "use strict";
    var CommandManager = brackets.getModule("command/CommandManager"),
        ProjectManager = brackets.getModule("project/ProjectManager"),
        ExtensionUtils = brackets.getModule("utils/ExtensionUtils"),
        Dialogs = brackets.getModule("widgets/Dialogs"),
        DefaultDialogs = brackets.getModule("widgets/DefaultDialogs"),
        NativeFileSystemOBJ = brackets.getModule("file/NativeFileSystem"),
        FileSystem = brackets.getModule("filesystem/FileSystem"),
        Directory = brackets.getModule("filesystem/Directory"),
        FileUtils = brackets.getModule("file/FileUtils"),
        Menus = brackets.getModule("command/Menus"),
        projectMenu = Menus.getContextMenu(Menus.ContextMenuIds.PROJECT_MENU),
        workingsetMenu = Menus.getContextMenu(Menus.ContextMenuIds.WORKING_SET_MENU),
        modulePath = ExtensionUtils.getModulePath(module),
        userName = modulePath.split("/")[2],
        selectedPath='',
        commands;

    var config = JSON.parse(require('text!config.json')),
        formatters = config["formatters"],
        pathMap = config["path-map"],
        commentsHeader = "",
        commentsFooter = "",
        headerFileEntry = new NativeFileSystemOBJ.NativeFileSystem.FileEntry(modulePath + pathMap["header-comments"]),
        footerFileEntry = new NativeFileSystemOBJ.NativeFileSystem.FileEntry(modulePath + pathMap["footer-comments"]);

    FileUtils.readAsText(headerFileEntry).done(function (comments) {
        commentsHeader = comments;
    });
    
    FileUtils.readAsText(footerFileEntry).done(function (comments) {
        commentsFooter = comments;
    });

    
    var CONTEXT_NGAPP = "create_angular_app",
        CONTEXT_NGCOMPONENT = "create_angular_component";

    function cleanMenu(menu) {
        var i;
        for (i = 0; i < commands.length; i++) {
            projectMenu.removeMenuItem(commands[i]);
        }
    }
    
    function addMenus(menu){
        var entry = ProjectManager.getSelectedItem();
        cleanMenu(menu);
        if(entry.isDirectory){
           selectedPath = entry.fullPath;
        }else{
            selectedPath = entry.parentPath;
        }        
        menu.addMenuItem(CONTEXT_NGAPP, "", Menus.First);
        menu.addMenuItem(CONTEXT_NGCOMPONENT, "", Menus.First); 
    }
    
    $(projectMenu).on("beforeContextMenuOpen", function (evt) {
         addMenus(projectMenu);
    });

    $(workingsetMenu).on("beforeContextMenuOpen", function (evt) {
       addMenus(workingsetMenu);
    });

    function createAngularApp(appName, tmplUrl) {
        console.log("creating angular app...");
        var boilerplateDir = FileSystem.getDirectoryForPath(tmplUrl);
        cloneDir(boilerplateDir, selectedPath+appName, true); 
    }
    
    function cloneDir(dir,toPath,contentOnly){
        toPath = toPath+"/" + (contentOnly?'':dir.name);
        var newDir =  FileSystem.getDirectoryForPath(toPath); 
         newDir.create(function(error, stat){
             dir.getContents(function(err, contents){
                contents.forEach(function(entry){
                   if(entry.isDirectory){
                     cloneDir(entry,toPath); 
                  }else{
                        cloneFile(entry,toPath);
                    }
                });
        
            });                    
         });
    }
    
    function cloneFile(file, toPath){
        toPath = toPath+file.name;
        file.read(function(err, content){
          var fileEntry = new NativeFileSystemOBJ.NativeFileSystem.FileEntry(toPath);
          FileUtils.writeText(fileEntry, content);  
        });
    }
    

    function applyCustomFormatters(srcCode){
        var placeHolderFormaters = config["place-holders"];
          for(var i in placeHolderFormaters){
                srcCode = srcCode.replace(i, placeHolderFormaters[i]);
          } 
        return srcCode;
    }
    
    function createAngularComponent(compType, compName, moduleName, comFileName) {
        var templateUrl = modulePath + pathMap[compType],
            srcFileEntry = new NativeFileSystemOBJ.NativeFileSystem.FileEntry(templateUrl),
            targetFileEntry = new NativeFileSystemOBJ.NativeFileSystem.FileEntry(selectedPath + "/" + comFileName);

        FileUtils.readAsText(srcFileEntry).done(function (srcCode, readTimestamp) {
             
            srcCode = srcCode.replace(/<module-name>/g, moduleName);
            srcCode = srcCode.replace(/<component-name>/g, compName);
            var commentsHdr = commentsHeader.replace(/<author>/g, userName);
            commentsHdr = commentsHdr.replace(/<created>/g, new Date());
            commentsHdr = commentsHdr.replace(/<description>/g, compType + ":" + moduleName + "." + compName);
            
            srcCode = applyCustomFormatters(srcCode);
            commentsHdr = applyCustomFormatters(commentsHdr );
            var commentsFtr = applyCustomFormatters(commentsFooter);
            
            srcCode = commentsHdr + "\n \n" + srcCode+"\n \n"+commentsFtr;
            FileUtils.writeText(targetFileEntry, srcCode);
        });

    }
    
    
    function getAppTemplates(){
        var appTemplatePath = pathMap["app-templates"],
            dir = FileSystem.getDirectoryForPath(modulePath+appTemplatePath),
            dirUrls=[],
            dirHTML="";
        
         dir.getContents(function(err, contents){
                contents.forEach(function(entry){
                   dirUrls.push(entry.fullPath);
                   dirHTML=dirHTML+"<li><b>"+entry.name+":</b>&nbsp; <input type='radio' data-url='"+entry.fullPath+"' data-appname='"+entry.name+"' name ='appTemplate' class='appTemplate'></li>" ;
                });
             
              $("#angModules").html(dirHTML);
              $("#angModules").click(function(event){
                   console.log(event.target);
                selectedAppName = $(event.target).attr("data-appname")
                selectedAppPath = $(event.target).attr("data-url")
              });       

            });
        
    }
    
    var selectedAppName, 
        selectedAppPath;

    function OpenAppCreationDlg() {
        var templateUrl = modulePath + pathMap["app-popup"],
            fileEntry = new NativeFileSystemOBJ.NativeFileSystem.FileEntry(templateUrl);

        FileUtils.readAsText(fileEntry).done(function (rawTemplate, readTimestamp) {
            var dlg = Dialogs.showModalDialogUsingTemplate(Mustache.render(rawTemplate, {}), false); 
            getAppTemplates();

            $(".btn-cancel").on("click", function () {
                dlg.close();
            });
            
            $(".btn-create").click(function () {
                var appName = $("#appName").val();
                createAngularApp(appName, selectedAppPath);
                dlg.close();
            });
            
           
        }).fail(function (err) {
            console.log("Error reading text: " + err.name);
        });
    }
    
    String.prototype.toProperCase = function(){
        var lst = this.split('');
        lst[0]=lst[0].toUpperCase();
        return lst.join('');
    }

    function OpenComponentCreationDlg() {
        var templateUrl = modulePath + pathMap["component-popup"],
            fileEntry = new NativeFileSystemOBJ.NativeFileSystem.FileEntry(templateUrl),
            componentType = $("#ngComponent option:selected").text(),
            componentName,
            componentFileName,
            moduleName;

        FileUtils.readAsText(fileEntry).done(function (rawTemplate, readTimestamp) {
            var dlg = Dialogs.showModalDialogUsingTemplate(Mustache.render(rawTemplate, {}), false);
            
            $("#ngComponent").change(function(){
                componentType = $("#ngComponent option:selected").val();
                $("#selCompType").text(componentType);
            });
            
            $("#ngCompName").keyup(function(){
                componentType = $("#ngComponent option:selected").val();
                componentName = $(this).val();
                var postFix = config["file-postfix"][componentType],      
                    compNameFomatter =  formatters["componentName"] || "value" ,
                    compFileNameFomatter =  formatters["componentFileName"] || "value";
                    var compNameFormatterFunc =  new Function("value",compNameFomatter);
                    var compFileNameFormatterFunc =  new Function("value",compFileNameFomatter);
                
                componentFileName = compFileNameFormatterFunc(componentName+postFix+".js");
                componentName = compNameFormatterFunc(componentName+postFix);
                
                $("#formatedCompName").text(componentName);
                $("#formatedFileName").text(componentFileName);
            });
            
            $("#ngModuleName").keyup(function(){
                moduleName = $(this).val();
                var moduleFomatter =  formatters["moduleName"] || "value" ,
                    moduleFomatterFunction =  new Function("value",moduleFomatter);
                
                moduleName = moduleFomatterFunction(moduleName);
                $("#formattedModuleName").text(moduleName);
            });
            
            $(".btn-cancel").on("click", function () {
                dlg.close();
            });
        
            $(".btn-create").click(function () {
                createAngularComponent(componentType, componentName, moduleName,componentFileName);
                dlg.close();
            });

        }).fail(function (err) {
            console.log("Error reading text: " + err.name);
        });
    }
    commands = [CONTEXT_NGAPP,CONTEXT_NGCOMPONENT];
    var appCreationCommand = CommandManager.register("New Angular Application", CONTEXT_NGAPP, OpenAppCreationDlg);
    var compCreationCommand = CommandManager.register("New Angular Component", CONTEXT_NGCOMPONENT, OpenComponentCreationDlg);

});